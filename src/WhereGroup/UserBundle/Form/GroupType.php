<?php

namespace WhereGroup\UserBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;

/**
 * Class GroupType
 * @package WhereGroup\UserBundle\Form
 */
class GroupType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('role', TextType::class, ['label' => 'Gruppe'])
            ->add('description', TextareaType::class, [
                'label'    => 'Beschreibung',
                'required' => false
            ])
            ->add(
                'users',
                EntityType::class,
                [
                    'class'        =>  'MetadorUserBundle:User',
                    'multiple'     => true,
                    'choice_label' => 'username',
                    'label'        => 'Benutzer',
                    'required'     => false
                ]
            );
    }

    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'WhereGroup\UserBundle\Entity\Group'
        ]);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'metador_userbundle_grouptype';
    }
}
